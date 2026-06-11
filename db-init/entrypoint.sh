#!/bin/bash

echo "Lado Coffee: Đang đợi SQL Server khởi động..."
sleep 40s

echo "Lado Coffee: Bắt đầu khởi tạo database..."

/opt/mssql-tools18/bin/sqlcmd \
-S localhost \
-U sa \
-P "CafePos@123456" \
-C \
-d master \
-i /usr/config/init.sql

if [ $? -eq 0 ]; then
  echo "Lado Coffee: Đã khởi tạo Database thành công!"
else
  echo "Lado Coffee: Khởi tạo Database thất bại!"
  exit 1
fi