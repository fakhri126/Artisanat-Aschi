package com.artisanataschi.backend.service;

import com.artisanataschi.backend.domain.Delivery;
import com.artisanataschi.backend.repository.DeliveryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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

    public Delivery saveDelivery(Delivery delivery) {
        return deliveryRepository.save(delivery);
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
