# Stock Signal UI

React frontend for the stock-signal-api. Connects to two endpoints:
- `/api/v1/signal/{symbol}` — single stock analysis
- `/api/v1/screener` — batch screener

## Local development

```bash
cp .env.example .env
npm install
npm start
```

## Deploy to AWS S3

### 1. Create S3 bucket
```bash
aws s3 mb s3://stock-signal-ui --region ap-south-1
aws s3 website s3://stock-signal-ui \
  --index-document index.html \
  --error-document index.html
```

### 2. Set bucket policy (public read)
```bash
aws s3api put-bucket-policy --bucket stock-signal-ui --policy '{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::stock-signal-ui/*"
  }]
}'
```

### 3. Add GitHub secrets
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `S3_BUCKET_NAME` = `stock-signal-ui`
- `API_BASE_URL` = your ALB URL

### 4. Push to main → auto deploys

Your app will be live at:
`http://stock-signal-ui.s3-website.ap-south-1.amazonaws.com`
