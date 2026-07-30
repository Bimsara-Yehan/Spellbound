package com.spellbound.shared.config;

import com.spellbound.catalogue.CategoryRepository;
import com.spellbound.catalogue.ProductRepository;
import com.spellbound.catalogue.ProductVariantRepository;
import com.spellbound.inventory.InventoryRepository;
import com.spellbound.inventory.StockAdjustmentAuditRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.lang.reflect.Proxy;
import java.util.Optional;

/**
 * Spring configuration active only during `docs` profile (used by `generateOpenApiDocs`
 * task in CI where PostgreSQL/Redis auto-configurations are excluded). Provides mock
 * repositories so the controller layer can boot long enough to generate openapi.yaml.
 */
@Configuration
@Profile("docs")
public class DocsProfileConfig {

    @SuppressWarnings("unchecked")
    private <T> T createProxy(Class<T> interfaceClass) {
        return (T) Proxy.newProxyInstance(
                interfaceClass.getClassLoader(),
                new Class<?>[]{interfaceClass},
                (proxy, method, args) -> {
                    if (method.getReturnType().equals(Optional.class)) {
                        return Optional.empty();
                    }
                    if (method.getReturnType().equals(boolean.class) || method.getReturnType().equals(Boolean.class)) {
                        return false;
                    }
                    return null;
                }
        );
    }

    @Bean
    public CategoryRepository categoryRepository() {
        return createProxy(CategoryRepository.class);
    }

    @Bean
    public ProductRepository productRepository() {
        return createProxy(ProductRepository.class);
    }

    @Bean
    public ProductVariantRepository productVariantRepository() {
        return createProxy(ProductVariantRepository.class);
    }

    @Bean
    public InventoryRepository inventoryRepository() {
        return createProxy(InventoryRepository.class);
    }

    @Bean
    public StockAdjustmentAuditRepository stockAdjustmentAuditRepository() {
        return createProxy(StockAdjustmentAuditRepository.class);
    }
}
