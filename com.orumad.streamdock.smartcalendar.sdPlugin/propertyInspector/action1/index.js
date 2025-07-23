/// <reference path="../utils/common.js" />
/// <reference path="../utils/action.js" />

const $local = true, $back = false, $dom = {
    main: $('.sdpi-wrapper'),
    appPath: $('#appPath'),
    quickSelect: $('#quickSelect'),
    customUrlContainer: $('#customUrlContainer'),
    previewCanvas: $('#previewCanvas')
};

const $propEvent = {
    didReceiveSettings(data) {
        // Wait a bit for the proxy to be set up, then load saved settings
        setTimeout(() => {
            if ($settings && $settings.appPath) {
                const appPath = $settings.appPath;
                console.log('Loading saved appPath:', appPath);
                
                // Check if it's a predefined option or custom
                const predefinedOptions = [
                    'https://calendar.google.com/',
                    'https://outlook.com/calendar',
                    'https://www.icloud.com/calendar',
                    'https://calendar.yahoo.com/',
                    'https://www.notion.so/calendar',
                    'https://todoist.com/app',
                    'https://app.any.do/',
                    'https://www.ticktick.com/webapp/'
                ];
                
                if (predefinedOptions.includes(appPath)) {
                    console.log('Setting predefined option:', appPath);
                    $dom.quickSelect.value = appPath;
                } else {
                    console.log('Setting custom option:', appPath);
                    $dom.quickSelect.value = 'custom';
                    $dom.appPath.value = appPath;
                }
                
                // Always call handleQuickSelection to update UI
                handleQuickSelection();
            } else {
                console.log('No saved settings found');
            }
            
            // Update preview
            drawPreview();
        }, 200);
    },
    sendToPropertyInspector(data) {
        console.log('Received from plugin:', data);
    }
};

// Handle quick selection changes
function handleQuickSelection() {
    const selectedValue = $dom.quickSelect.value;
    
    if (selectedValue === 'custom') {
        // Show custom URL input field
        $dom.customUrlContainer.style.display = 'block';
        // Don't auto-save, wait for user to enter custom URL
    } else if (selectedValue) {
        // Hide custom URL input field
        $dom.customUrlContainer.style.display = 'none';
        // Use predefined URL
        if ($settings) {
            $settings.appPath = selectedValue;
        }
    } else {
        // Hide custom URL input field
        $dom.customUrlContainer.style.display = 'none';
    }
}

// No file picker needed anymore since we only support web URLs

// Draw calendar preview
function drawPreview() {
    const canvas = $dom.previewCanvas;
    const ctx = canvas.getContext('2d');
    const now = new Date();
    const day = now.getDate();
    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN",
                       "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const month = monthNames[now.getMonth()];
    
    // Clear canvas
    ctx.clearRect(0, 0, 72, 72);
    
    // Create rounded rectangle background
    const radius = 6;
    roundedRect(ctx, 4, 4, 64, 64, radius);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    
    // Calendar header (month) with rounded top corners
    roundedRect(ctx, 4, 4, 64, 18, radius, true, false);
    ctx.fillStyle = "#e74c3c";
    ctx.fill();
    
    // Month text - larger and in uppercase
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 9px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(month, 36, 13);
    
    // Day number - much larger and centered in white area
    ctx.fillStyle = "#2c3e50";
    ctx.font = "bold 32px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    // Center vertically in the white area (header is 18px, so white area starts at y=22)
    const whiteAreaStart = 22;
    const whiteAreaEnd = 68;
    const whiteAreaCenter = whiteAreaStart + (whiteAreaEnd - whiteAreaStart) / 2;
    ctx.fillText(day.toString(), 36, whiteAreaCenter);
    
    // Subtle border with rounded corners
    roundedRect(ctx, 4, 4, 64, 64, radius);
    ctx.strokeStyle = "#bdc3c7";
    ctx.lineWidth = 1;
    ctx.stroke();
}

// Helper function to draw rounded rectangles for preview
function roundedRect(ctx, x, y, width, height, radius, topOnly = false, bottomOnly = false) {
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
}

// Save settings when changed (only for custom URL)
function saveCustomUrl() {
    // Use the global $settings proxy to save data automatically
    if ($settings && $dom.quickSelect.value === 'custom') {
        $settings.appPath = $dom.appPath.value.trim();
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Wait for elements to be ready
    setTimeout(() => {
        $dom.appPath.on('input', function() {
            saveCustomUrl();
        });
        
        $dom.quickSelect.on('change', function() {
            handleQuickSelection();
        });
        
        // Initial setup - if no settings loaded yet, set default
        setTimeout(() => {
            if (!$settings || !$settings.appPath || $dom.quickSelect.value === '') {
                console.log('Setting default Google Calendar');
                $dom.quickSelect.value = 'https://calendar.google.com/';
                if ($settings) {
                    $settings.appPath = 'https://calendar.google.com/';
                }
                handleQuickSelection();
            }
        }, 300);
        
        // Initial preview draw
        drawPreview();
        
        // Update preview every minute
        setInterval(drawPreview, 60000);
    }, 200);
});