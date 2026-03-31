package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import java.util.Arrays;

@Configuration
public class CorsConfig {
    
    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // Allow credentials (cookies, authorization headers)
        config.setAllowCredentials(true);
        
        // Specify exact origins (not patterns in production)
        config.setAllowedOrigins(Arrays.asList(
            "http://localhost:3000"    // Development
            //"https://yourdomain.com"     // Production
        ));
        
        config.setAllowedMethods(Arrays.asList(
            "GET",
            "POST", 
            "PUT",
            "DELETE",
            "OPTIONS"  // Required for preflight requests
        ));
        
        // Specify exact headers your frontend sends
        config.setAllowedHeaders(Arrays.asList(
            "Authorization",
            "Content-Type",
            "Accept",
            "X-Requested-With",
            "Host",
            "Origin",
            "User-Agent",
            "Referer"
        ));
        
        // Specify headers you want to expose to the frontend
        config.setExposedHeaders(Arrays.asList(
            "Authorization",
            "Content-Disposition",
            "Content-Type",
            "X-FutureLok-Error"
        ));
        
        // How long (in seconds) the preflight request can be cached
        config.setMaxAge(3600L);
        
        source.registerCorsConfiguration("/api/**", config);
        return new CorsFilter(source);
    }
}