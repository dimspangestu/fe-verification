APP_NAME="MOSQUE"

echo "📥 Pulling latest changes from Git..."
git pull

echo "🔁 Stopping existing PM2 process..."
pm2 stop $APP_NAME
pm2 delete $APP_NAME

echo "🧹 Removing .next cache..."
rm -rf .next

echo "🔨 Installing dependencies..."
npm install --legacy-peer-deps

echo "🏗️ Building the app..."
npm run build

echo "🚀 Starting the app in dev mode with PM2..."
pm2 start npm --name "$APP_NAME" -- run start

echo "✅ Deployment complete!"

