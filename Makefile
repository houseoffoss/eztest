# ECR設定
ECR_REGISTRY := 381492258078.dkr.ecr.ap-northeast-1.amazonaws.com
ECR_REPOSITORY := eztest
IMAGE_NAME := falcon9-eztest
AWS_REGION := ap-northeast-1
AWS_PROFILE := falcon9-dev-eztest

# タイムスタンプ (YYYYMMDDHHmmss形式)
TIMESTAMP := $(shell date +%Y%m%d%H%M%S)

.PHONY: login build tag push deploy

# ECRにログイン
login:
	aws ecr get-login-password --region $(AWS_REGION) --profile $(AWS_PROFILE) | docker login --username AWS --password-stdin $(ECR_REGISTRY)

# Dockerイメージをビルド
build:
	docker build --platform linux/amd64 -t $(IMAGE_NAME):$(TIMESTAMP) .
	@echo "Built image: $(IMAGE_NAME):$(TIMESTAMP)"

# イメージにタグ付け
tag:
	docker tag $(IMAGE_NAME):$(TIMESTAMP) $(ECR_REGISTRY)/$(ECR_REPOSITORY):$(TIMESTAMP)
	@echo "Tagged: $(ECR_REGISTRY)/$(ECR_REPOSITORY):$(TIMESTAMP)"

# ECRにプッシュ
push:
	docker push $(ECR_REGISTRY)/$(ECR_REPOSITORY):$(TIMESTAMP)
	@echo "Pushed: $(ECR_REGISTRY)/$(ECR_REPOSITORY):$(TIMESTAMP)"

# ビルドからプッシュまで一括実行
deploy: login
	$(eval TIMESTAMP := $(shell date +%Y%m%d%H%M%S))
	docker build --platform linux/amd64 -t $(IMAGE_NAME):$(TIMESTAMP) .
	docker tag $(IMAGE_NAME):$(TIMESTAMP) $(ECR_REGISTRY)/$(ECR_REPOSITORY):$(TIMESTAMP)
	docker push $(ECR_REGISTRY)/$(ECR_REPOSITORY):$(TIMESTAMP)
	@echo "=== Deploy completed ==="
	@echo "Image: $(ECR_REGISTRY)/$(ECR_REPOSITORY):$(TIMESTAMP)"
