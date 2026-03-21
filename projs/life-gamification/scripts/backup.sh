#!/bin/bash
# Backup do banco de dados
set -e

DB_PATH="data/gamification.db"
BACKUP_DIR="backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/gamification_$TIMESTAMP.db"

mkdir -p "$BACKUP_DIR"

if [ -f "$DB_PATH" ]; then
    sqlite3 "$DB_PATH" ".backup '$BACKUP_FILE'"
    echo "✅ Backup salvo: $BACKUP_FILE"
    echo "📦 Tamanho: $(du -h $BACKUP_FILE | cut -f1)"
else
    echo "❌ Banco não encontrado: $DB_PATH"
    exit 1
fi

# Lista backups recentes
echo ""
echo "📋 Backups recentes:"
ls -lh "$BACKUP_DIR"/*.db 2>/dev/null | tail -5 || echo "Nenhum backup encontrado"
