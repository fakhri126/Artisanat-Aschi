package com.artisanataschi.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class MvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Expose the 'uploads/' folder as a static resource under '/uploads/**'
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
    }
}
