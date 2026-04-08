package com.ServiceProduct.fullstack.entity.keys;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;
import java.io.Serializable;

@Embeddable
@Data @NoArgsConstructor @AllArgsConstructor @EqualsAndHashCode
public class CongThucId implements Serializable {
    @Column(name = "maSanPham", length = 20)
    private String maSanPham;

    @Column(name = "maNguyenLieu", length = 20)
    private String maNguyenLieu;
}