#!/bin/bash

echo "🔄 Restoring data from Neon database..."

# Neon database URL
NEON_URL='postgresql://neondb_owner:npg_ZF5OApex6PzR@ep-cold-dew-afe982rw-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

# Create backup directory if it doesn't exist
mkdir -p backups

# Create timestamp for backup filename
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="backups/neon_restore_${TIMESTAMP}.sql"

echo "📥 Creating backup from Neon..."
pg_dump "$NEON_URL" --data-only --inserts > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Backup created successfully: $BACKUP_FILE"
    echo "📁 Backup size: $(du -h "$BACKUP_FILE" | cut -f1)"
else
    echo "❌ Backup from Neon failed"
    exit 1
fi

echo "🔄 Creating Reaction table (if missing)..."
psql -U ashish -d mydb -c "
CREATE TABLE IF NOT EXISTS \"Reaction\" (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    \"messageId\" text NOT NULL,
    \"userId\" text NOT NULL,
    emoji character varying(255) NOT NULL,
    \"createdAt\" timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT \"Reaction_pkey\" PRIMARY KEY (id),
    CONSTRAINT \"unique_message_user\" UNIQUE (\"messageId\", \"userId\"),
    CONSTRAINT \"Reaction_messageId_fkey\" FOREIGN KEY (\"messageId\") REFERENCES \"Message\"(id),
    CONSTRAINT \"Reaction_userId_fkey\" FOREIGN KEY (\"userId\") REFERENCES \"User\"(id)
);" > /dev/null 2>&1

echo "🔄 Restoring data to local database..."
psql -U ashish -d mydb -f "$BACKUP_FILE" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Data restored successfully to local database"
    
    # Show data counts
    echo ""
    echo "📊 Data restored:"
    echo "  Users: $(psql -U ashish -d mydb -t -c 'SELECT COUNT(*) FROM "User";' | xargs)"
    echo "  Chats: $(psql -U ashish -d mydb -t -c 'SELECT COUNT(*) FROM "Chat";' | xargs)"
    echo "  Messages: $(psql -U ashish -d mydb -t -c 'SELECT COUNT(*) FROM "Message";' | xargs)"
    echo "  Reactions: $(psql -U ashish -d mydb -t -c 'SELECT COUNT(*) FROM "Reaction";' | xargs)"
else
    echo "❌ Restore to local database failed"
    exit 1
fi

echo "🎉 Restore process completed!"
echo "📁 Backup saved as: $BACKUP_FILE"
echo ""
echo "💡 Your app now has all data including message reactions!"