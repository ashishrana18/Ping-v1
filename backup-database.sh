#!/bin/bash

echo "💾 Creating database backup..."

# Create backup directory if it doesn't exist
mkdir -p backups

# Create timestamp for backup filename
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="backups/mydb_backup_${TIMESTAMP}.sql"

# Create backup
pg_dump -U ashish -h localhost -d mydb > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Backup created successfully: $BACKUP_FILE"
    echo "📁 Backup size: $(du -h "$BACKUP_FILE" | cut -f1)"
else
    echo "❌ Backup failed"
    exit 1
fi

# Keep only last 5 backups
echo "🧹 Cleaning old backups (keeping last 5)..."
cd backups
ls -t mydb_backup_*.sql | tail -n +6 | xargs -r rm
cd ..

echo "🎉 Backup process completed!"
