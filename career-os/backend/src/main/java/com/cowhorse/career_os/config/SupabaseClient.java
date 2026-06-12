package com.cowhorse.career_os.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "supabase")
public class SupabaseClient {
    
    private String url;
    private String apiKey;
    private String serviceKey;

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public String getServiceKey() { 
        return serviceKey; 
    }
    
    public void setServiceKey(String serviceKey) { 
        this.serviceKey = serviceKey; 
    }
}
