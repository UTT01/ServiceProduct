// File: fullstack/src/main/java/com/ServiceProduct/fullstack/controller/FileUploadController.java
package com.ServiceProduct.fullstack.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/upload")
@CrossOrigin("http://localhost:5173")
public class FileUploadController {
    // Đường dẫn này phải khớp với cấu hình trong application.properties
    private final String UPLOAD_DIR = "D:/LDPlayer/ServiceProduct/uploads/";

    @PostMapping
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            // Lấy tên gốc để trích xuất đuôi file (ví dụ: .png, .jpg)
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            
            // TẠO TÊN FILE MỚI: Chỉ gồm mã ngẫu nhiên UUID + đuôi file (Tuyệt đối không dùng tên gốc)
            String fileName = UUID.randomUUID().toString() + extension;
            
            Path path = Paths.get(UPLOAD_DIR + fileName);
            Files.createDirectories(path.getParent());
            Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
            
            return ResponseEntity.ok("http://localhost:8087/images/" + fileName);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Lỗi upload: " + e.getMessage());
        }
    }
}