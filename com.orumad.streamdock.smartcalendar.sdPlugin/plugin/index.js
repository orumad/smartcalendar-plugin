/// <reference path="./utils/common.js" />
/// <reference path="./utils/axios.js" />

const plugin = new Plugins("smartcalendar");

// Smart Calendar Action
plugin.action1 = new Actions({
    default: {
        appPath: "https://calendar.google.com/" // Default to Google Calendar
    },
    _willAppear({ context }) {
        this.updateCalendar(context);
        // Update calendar every minute
        plugin.setInterval("calendar-update", () => {
            this.updateCalendar(context);
        }, 60000);
    },
    _willDisappear({ context }) {
        plugin.clearInterval("calendar-update");
    },
    keyDown({ context }) {
        // Due to StreamDock security limitations, we cannot directly open applications
        // Instead, we'll open a web-based calendar or show helpful information
        const settings = this.data[context];
        const appPath = settings?.appPath || "/Applications/Calendar.app";
        
        if (appPath.trim()) {
            // If it's already a web URL, open it directly
            if (appPath.startsWith("http://") || appPath.startsWith("https://")) {
                window.socket.openUrl(appPath);
                return;
            }
            
            // For local applications, we'll open a helpful web calendar
            // Open Google Calendar as fallback without showing any message
            window.socket.openUrl("https://calendar.google.com/");
        }
    },
    
    showTemporaryMessage(context, message) {
        // Show a temporary message on the button
        window.socket.setTitle(context, message);
    },
    updateCalendar(context) {
        const now = new Date();
        const day = now.getDate();
        const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN",
                           "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        const month = monthNames[now.getMonth()];
        
        // Create calendar image with current day
        this.drawCalendarImage(context, day, month);
    },
    drawCalendarImage(context, day, month) {
        const canvas = document.createElement("canvas");
        canvas.width = 144;
        canvas.height = 144;
        const ctx = canvas.getContext("2d");
        
        // Clear canvas
        ctx.clearRect(0, 0, 144, 144);
        
        // Create rounded rectangle background
        const radius = 12;
        this.roundedRect(ctx, 8, 8, 128, 128, radius);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        
        // Calendar header (month) with rounded top corners
        this.roundedRect(ctx, 8, 8, 128, 35, radius, true, false);
        ctx.fillStyle = "#e74c3c";
        ctx.fill();
        
        // Month text - larger and in uppercase
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 18px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(month, 72, 25);
        
        // Day number - much larger and centered in white area
        ctx.fillStyle = "#2c3e50";
        ctx.font = "bold 64px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        // Center vertically in the white area (header is 35px, so white area starts at y=43)
        const whiteAreaStart = 43;
        const whiteAreaEnd = 136;
        const whiteAreaCenter = whiteAreaStart + (whiteAreaEnd - whiteAreaStart) / 2;
        ctx.fillText(day.toString(), 72, whiteAreaCenter);
        
        // Subtle border with rounded corners
        this.roundedRect(ctx, 8, 8, 128, 128, radius);
        ctx.strokeStyle = "#bdc3c7";
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Set the image
        window.socket.setImage(context, canvas.toDataURL("image/png"));
    },
    
    // Helper function to draw rounded rectangles
    roundedRect(ctx, x, y, width, height, radius, topOnly = false, bottomOnly = false) {
        ctx.beginPath();
        
        if (topOnly) {
            // Only round top corners
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + width - radius, y);
            ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
            ctx.lineTo(x + width, y + height);
            ctx.lineTo(x, y + height);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
        } else if (bottomOnly) {
            // Only round bottom corners
            ctx.moveTo(x, y);
            ctx.lineTo(x + width, y);
            ctx.lineTo(x + width, y + height - radius);
            ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            ctx.lineTo(x + radius, y + height);
            ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
            ctx.lineTo(x, y);
        } else {
            // All corners rounded
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + width - radius, y);
            ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
            ctx.lineTo(x + width, y + height - radius);
            ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            ctx.lineTo(x + radius, y + height);
            ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
        }
        
        ctx.closePath();
    },
    dialRotate(data) {// Knob rotation
        console.log("Calendar dial rotated:", data);
    },
    dialDown(data) {// Knob press
        console.log("Calendar dial pressed:", data);
    }
});