#!/bin/bash

echo "🚀 Starting Telegram App Database..."

# Check if PostgreSQL is running
if brew services list | grep -q "postgresql@16.*started"; then
    echo "✅ PostgreSQL is already running"
else
    echo "🔄 Starting PostgreSQL..."
    brew services start postgresql@16
    sleep 3
    echo "✅ PostgreSQL started"
fi

# Check database connection
if psql -U ashish -d mydb -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Database connection successful"
    echo "🎉 Ready to start your app!"
else
    echo "❌ Database connection failed"
    echo "🔧 Try running: createdb -U ashish mydb"
fi

echo ""
echo "📋 Quick commands:"
echo "  Start PostgreSQL: brew services start postgresql@16"
echo "  Stop PostgreSQL:  brew services stop postgresql@16"
echo "  Check status:      brew services list | grep postgresql"
echo "  Connect to DB:     psql -U ashish -d mydb"
