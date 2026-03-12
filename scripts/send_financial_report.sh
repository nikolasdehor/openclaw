#!/bin/bash
# Envia relatório financeiro via OpenClaw message send

REPORT_FILE="/tmp/financial_report.txt"

# Executa o gerador
python3 /data/.openclaw/workspace/scripts/financial_report.py > "$REPORT_FILE" 2>&1

# Se houve erro, envia erro
if [ $? -ne 0 ]; then
    ERROR=$(cat "$REPORT_FILE")
    openclaw message send --to +556286077431 --channel whatsapp --message "❌ Erro ao gerar relatório financeiro: $ERROR"
    exit 1
fi

# Envia o relatório
openclaw message send --to +556286077431 --channel whatsapp --message-file "$REPORT_FILE"
