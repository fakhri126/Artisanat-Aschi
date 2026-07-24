package com.artisanataschi.backend.domain;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

import jakarta.persistence.*;

@Entity
@Table(name = "relookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Relooking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(name = "image_avant_url", nullable = false)
    private String imageAvantUrl;

    @Column(name = "image_apres_url", nullable = false)
    private String imageApresUrl;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdDate;
}
