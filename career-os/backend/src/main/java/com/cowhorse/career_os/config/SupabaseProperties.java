package com.cowhorse.career_os.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "supabase.jwt")
public class SupabaseProperties {
    
    private String secret;
    private long expiration;

    public String getSecret() {
        return secret;
    }

    public void setSecret(String secret) {
        this.secret = secret;
    }

    public long getExpiration() {
        return expiration; // 24 hours in milliseconds
    }

    public void setExpiration(long expiration) {
        this.expiration = expiration;
    }
}