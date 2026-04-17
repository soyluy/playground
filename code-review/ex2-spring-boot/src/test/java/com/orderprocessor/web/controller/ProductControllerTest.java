package com.orderprocessor.web.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.orderprocessor.application.service.ProductService;
import com.orderprocessor.domain.entity.Product;
import com.orderprocessor.domain.enums.ProductCategory;
import com.orderprocessor.security.jwt.JwtAuthenticationFilter;
import com.orderprocessor.web.dto.request.CreateProductRequest;
import com.orderprocessor.web.mapper.ProductMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = ProductController.class)
@Import(ProductMapper.class)
class ProductControllerTest {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ProductService productService;

    @MockBean
    private JwtAuthenticationFilter jwtFilter;

    private Product product;

    @BeforeEach
    void setUp() {
        product = Product.builder()
                .sku("P-1")
                .name("Widget")
                .price(new BigDecimal("10.00"))
                .stockQuantity(50)
                .category(ProductCategory.ELECTRONICS)
                .active(true)
                .build();
        product.setId(UUID.randomUUID());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createProduct_adminCanCreate() throws Exception {
        when(productService.createProduct(any())).thenReturn(product);

        CreateProductRequest req = CreateProductRequest.builder()
                .sku("P-1")
                .name("Widget")
                .price(new BigDecimal("10.00"))
                .stockQuantity(50)
                .category(ProductCategory.ELECTRONICS)
                .build();

        mvc.perform(post("/api/products")
                        .with(SecurityMockMvcRequestPostProcessors.csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.sku").value("P-1"));
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void createProduct_customerCannotCreate() throws Exception {
        CreateProductRequest req = CreateProductRequest.builder()
                .sku("P-2")
                .name("Widget")
                .price(new BigDecimal("10.00"))
                .stockQuantity(1)
                .category(ProductCategory.ELECTRONICS)
                .build();

        mvc.perform(post("/api/products")
                        .with(SecurityMockMvcRequestPostProcessors.csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser
    void getProduct_returnsProduct() throws Exception {
        when(productService.getProductById(eq(product.getId()))).thenReturn(product);

        mvc.perform(get("/api/products/" + product.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Widget"));
    }

    @Test
    @WithMockUser
    void search_returnsPagedResult() throws Exception {
        when(productService.searchProducts(any(), any(), any()))
                .thenReturn(new PageImpl<>(List.of(product)));

        mvc.perform(get("/api/products").param("q", "widget"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].sku").value("P-1"));
    }
}
