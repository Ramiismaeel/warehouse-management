package training.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;

/**
 * Serves the React build from {@code classpath:/static/} (copied there by the deploy workflow).
 * Unknown paths fall back to {@code index.html}, so React Router handles deep links like {@code /artikel/5}.
 * Backend paths never fall back: an unknown {@code /api/...} or {@code /actuator/...} path stays a 404.
 * {@code /} itself is forwarded to {@code index.html} by Spring Boot's welcome page handling.
 * Controllers, Swagger UI and the H2 console have their own, more specific mappings and are not affected.
 */
@Configuration
public class SpaConfig implements WebMvcConfigurer {

    private static final String STATIC_LOCATION = "classpath:/static/";
    private static final String INDEX_HTML = "index.html";

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**")
                .addResourceLocations(STATIC_LOCATION)
                .resourceChain(true)
                .addResolver(new SpaFallbackResourceResolver());
    }

    private static final class SpaFallbackResourceResolver extends PathResourceResolver {

        @Override
        protected Resource getResource(String resourcePath, Resource location) throws IOException {
            if (resourcePath.startsWith("api/") || resourcePath.startsWith("actuator/")) {
                return null;
            }
            // super checks that the file exists, is readable and lies inside the static folder.
            Resource requested = super.getResource(resourcePath, location);
            return requested != null ? requested : super.getResource(INDEX_HTML, location);
        }
    }
}
