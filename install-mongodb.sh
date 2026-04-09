#!/bin/bash
# MongoDB 安装脚本 - 适用于 Ubuntu/Debian
# 密码: renqinbo

set -e

MONGO_PASSWORD="renqinbo"
MONGO_DATA_DIR="/var/lib/mongodb"
MONGO_LOG_DIR="/var/log/mongodb"
MONGO_PORT="27017"

echo "===== MongoDB 安装脚本 ====="

# 检测系统
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
else
    echo "无法检测操作系统"
    exit 1
fi

echo "检测到操作系统: $OS"

# 检查是否已安装
if command -v mongod &> /dev/null; then
    echo "MongoDB 已安装: $(mongod --version | head -1)"
    read -p "是否要重新安装？ (y/n): " confirm
    if [ "$confirm" != "y" ]; then
        echo "退出"
        exit 0
    fi
fi

install_mongodb_ubuntu() {
    echo "安装 MongoDB for Ubuntu..."

    # 导入 MongoDB GPG key
    curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

    # 添加仓库
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

    # 更新并安装
    sudo apt update
    sudo apt install -y mongodb-org
}

install_mongodb_debian() {
    echo "安装 MongoDB for Debian..."

    # 导入 MongoDB GPG key
    curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

    # 添加仓库
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/debian bookworm/mongodb-org/7.0 main" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

    # 更新并安装
    sudo apt update
    sudo apt install -y mongodb-org
}

# 根据系统安装
case $OS in
    ubuntu)
        install_mongodb_ubuntu
        ;;
    debian)
        install_mongodb_debian
        ;;
    *)
        echo "不支持的操作系统: $OS"
        echo "请手动安装 MongoDB: https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-linux/"
        exit 1
        ;;
esac

# 创建数据目录
echo "创建数据目录..."
sudo mkdir -p "$MONGO_DATA_DIR"
sudo chown -R mongodb:mongodb "$MONGO_DATA_DIR"

# 创建日志目录
echo "创建日志目录..."
sudo mkdir -p "$MONGO_LOG_DIR"
sudo chown -R mongodb:mongodb "$MONGO_LOG_DIR"

# 配置 MongoDB
echo "配置 MongoDB..."
sudo tee /etc/mongod.conf <<EOF
# MongoDB 配置文件
net:
  port: $MONGO_PORT
  bindIp: 127.0.0.1

storage:
  dbPath: $MONGO_DATA_DIR

systemLog:
  destination: file
  logAppend: true
  path: $MONGO_LOG_DIR/mongod.log

# 认证
security:
  authorization: enabled
EOF

# 设置密码
echo "设置管理员密码..."

# 启动 MongoDB（无认证先启动）
sudo systemctl enable mongod
sudo systemctl start mongod

# 等待启动
sleep 3

# 创建管理员用户
mongosh --quiet admin <<EOF
db.createUser({
  user: "root",
  pwd: "$MONGO_PASSWORD",
  roles: [
    { role: "root", db: "admin" }
  ]
});
print("管理员用户创建成功");
EOF

# 重启启用认证
echo "重启 MongoDB 启用认证..."
sudo systemctl restart mongod

echo ""
echo "===== MongoDB 安装完成 ====="
echo "连接字符串: mongodb://root:${MONGO_PASSWORD}@127.0.0.1:${MONGO_PORT}/renqing?authSource=admin"
echo ""
echo "常用命令:"
echo "  启动: sudo systemctl start mongod"
echo "  停止: sudo systemctl stop mongod"
echo "  状态: sudo systemctl status mongod"
echo "  连接: mongosh -u root -p ${MONGO_PASSWORD} --authenticationDatabase admin"
