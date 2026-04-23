package com.api.edutrack.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        final String esquemaSeguranca = "BearerAuth";

        return new OpenAPI()
                .info(new Info()
                        .title("EduTrack AI API")
                        .description("Documentacao da API do EduTrack AI")
                        .version("v1"))
                .addSecurityItem(new SecurityRequirement().addList(esquemaSeguranca))
                .components(new Components()
                        .addSecuritySchemes(esquemaSeguranca,
                                new SecurityScheme()
                                        .name(esquemaSeguranca)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")));
    }
}
