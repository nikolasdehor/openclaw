#!/bin/bash
# Reset completo do banco de dados
set -e

DB_PATH="data/gamification.db"

echo "🗑️  Resetando banco de dados..."

if [ -f "$DB_PATH" ]; then
    rm "$DB_PATH"
    echo "✅ Banco removido"
else
    echo "⚠️  Banco não existe"
fi

# Recria com seed
cd backend
python seed.py
cd ..

echo "✅ Banco resetado e populado"
echo "📊 Missões: $(sqlite3 $DB_PATH 'SELECT COUNT(*) FROM missions')"
echo "🏆 Achievements: $(sqlite3 $DB_PATH 'SELECT COUNT(*) FROM achievements')"
