#!/bin/bash

# Smart Calendar StreamDock Plugin Builder
# Crea el archivo .sdPlugin para distribución

set -e

echo "🚀 Construyendo Smart Calendar Plugin..."

# Variables
PLUGIN_NAME="SmartCalendar"
PLUGIN_VERSION=$(grep -o '"Version": "[^"]*"' com.orumad.streamdock.smartcalendar.sdPlugin/manifest.json | cut -d'"' -f4)
OUTPUT_FILE="${PLUGIN_NAME}-v${PLUGIN_VERSION}.sdPlugin"
PLUGIN_DIR="com.orumad.streamdock.smartcalendar.sdPlugin"

# Verificar que existe el directorio del plugin
if [ ! -d "$PLUGIN_DIR" ]; then
    echo "❌ Error: No se encuentra el directorio del plugin: $PLUGIN_DIR"
    exit 1
fi

# Limpiar archivos anteriores
if [ -f "$OUTPUT_FILE" ]; then
    echo "🧹 Eliminando versión anterior: $OUTPUT_FILE"
    rm "$OUTPUT_FILE"
fi

# Crear el archivo .sdPlugin (que es un ZIP renombrado)
echo "📦 Creando archivo $OUTPUT_FILE..."
cd "$PLUGIN_DIR"
zip -r "../$OUTPUT_FILE" . -x "*.DS_Store" "*.git*" "node_modules/*" "*.log"
cd ..

# Verificar que se creó correctamente
if [ -f "$OUTPUT_FILE" ]; then
    FILE_SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)
    echo "✅ Plugin creado exitosamente:"
    echo "   📄 Archivo: $OUTPUT_FILE"
    echo "   📦 Tamaño: $FILE_SIZE"
    echo "   🏷️  Versión: $PLUGIN_VERSION"
    echo ""
    echo "🎯 Listo para subir a space.key123.vip (Opción 3: archivo .sdPlugin)"
else
    echo "❌ Error: No se pudo crear el archivo del plugin"
    exit 1
fi

echo "🎉 ¡Construcción completada!"