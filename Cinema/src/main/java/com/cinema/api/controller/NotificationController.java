package com.cinema.api.controller;

import com.cinema.api.dto.NotificationDto;
import com.cinema.api.service.ProductService;
import com.cinema.api.service.RemainsService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final ProductService productService;
    private final RemainsService remainsService;

    public NotificationController(ProductService productService, RemainsService remainsService) {
        this.productService = productService;
        this.remainsService = remainsService;
    }

    @GetMapping
    public NotificationDto getNotifications() {
        List<String> expired = productService.getExpiredProductNames();
        List<String> expiringSoon = productService.getExpiringSoonProductNames(3);
        List<String> lowStock = remainsService.getLowStockProductNames(5);

        return new NotificationDto(expired, expiringSoon, lowStock);
    }
}