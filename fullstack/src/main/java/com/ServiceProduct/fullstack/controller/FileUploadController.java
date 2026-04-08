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
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path path = Paths.get(UPLOAD_DIR + fileName);
            Files.createDirectories(path.getParent());
            Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
            
            // Trả về URL để Frontend hiển thị (khớp với static-path-pattern /images/**)
            return ResponseEntity.ok("http://localhost:8080/images/" + fileName);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Lỗi upload: " + e.getMessage());
        }
    }
}