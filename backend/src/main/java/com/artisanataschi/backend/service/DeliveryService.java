package com.artisanataschi.backend.service;

import com.artisanataschi.backend.domain.Delivery;
import com.artisanataschi.backend.dto.DeliveryRequestDto;
import com.artisanataschi.backend.repository.DeliveryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class DeliveryService {

    @Autowired
    private DeliveryRepository deliveryRepository;

    public List<Delivery> getAllDeliveries() {
        return deliveryRepository.findAll();
    }

    public Optional<Delivery> getDeliveryById(Long id) {
        return deliveryRepository.findById(id);
    }

    public Delivery saveDelivery(DeliveryRequestDto dto) {
        Delivery delivery = new Delivery();
        delivery.setTitle(dto.getTitle());
        delivery.setDescription(dto.getDescription());
        delivery.setImageUrl(dto.getImageUrl());
        delivery.setDeliveryDate(dto.getDeliveryDate() != null ? dto.getDeliveryDate() : LocalDate.now());
        return deliveryRepository.save(delivery);
    }

    public Delivery saveDelivery(Delivery delivery) {
        return deliveryRepository.save(delivery);
    }

    public Delivery updateDelivery(Long id, DeliveryRequestDto dto) {
        return deliveryRepository.findById(id).map(delivery -> {
            delivery.setTitle(dto.getTitle());
            delivery.setDescription(dto.getDescription());
            delivery.setImageUrl(dto.getImageUrl());
            if (dto.getDeliveryDate() != null) {
                delivery.setDeliveryDate(dto.getDeliveryDate());
            }
            return deliveryRepository.save(delivery);
        }).orElseThrow(() -> new RuntimeException("Delivery not found with id " + id));
    }

    public Delivery updateDelivery(Long id, Delivery deliveryDetails) {
        return deliveryRepository.findById(id).map(delivery -> {
            delivery.setTitle(deliveryDetails.getTitle());
            delivery.setDescription(deliveryDetails.getDescription());
            delivery.setImageUrl(deliveryDetails.getImageUrl());
            delivery.setDeliveryDate(deliveryDetails.getDeliveryDate());
            return deliveryRepository.save(delivery);
        }).orElseThrow(() -> new RuntimeException("Delivery not found with id " + id));
    }

    public void deleteDelivery(Long id) {
        deliveryRepository.deleteById(id);
    }
}
