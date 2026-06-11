package com.example.servicecafe.service;

import java.util.UUID;

final class HoaDonIdGenerator {

    private HoaDonIdGenerator() {
    }

    static String newHoaDonId() {
        return "HD" + UUID.randomUUID().toString().replace("-", "");
    }

    static String newChiTietHoaDonId() {
        return "CT" + UUID.randomUUID().toString().replace("-", "");
    }
}
