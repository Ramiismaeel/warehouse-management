package training.backend.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.forwardedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Uses the stand-in React build in src/test/resources/static (the real one is only copied in by the deploy workflow). */
@SpringBootTest
@AutoConfigureMockMvc
class SpaConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void root_forwardsToIndexHtml() throws Exception {
        // Spring Boot's welcome page; MockMvc doesn't follow forwards, so check the target instead.
        mockMvc.perform(get("/"))
                .andExpect(status().isOk())
                .andExpect(forwardedUrl("index.html"));
    }

    @Test
    void indexHtml_isServed() throws Exception {
        mockMvc.perform(get("/index.html"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("spa-test-index")));
    }

    @Test
    void existingFile_isServedAsIs() throws Exception {
        mockMvc.perform(get("/assets/app.js"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("spa-test-asset")));
    }

    @Test
    void deepLink_fallsBackToIndexHtml() throws Exception {
        mockMvc.perform(get("/artikel/5/bearbeiten"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("spa-test-index")));
    }

    @Test
    void unknownApiPath_staysNotFound() throws Exception {
        mockMvc.perform(get("/api/v1/does-not-exist"))
                .andExpect(status().isNotFound());
    }

    @Test
    void unknownActuatorPath_staysNotFound() throws Exception {
        mockMvc.perform(get("/actuator/env"))
                .andExpect(status().isNotFound());
    }

    @Test
    void apiEndpoint_isStillHandledByController() throws Exception {
        mockMvc.perform(get("/api/v1/products"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith("application/json"));
    }
}
