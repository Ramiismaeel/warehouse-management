package training.backend.document;

import lombok.RequiredArgsConstructor;

import java.time.ZoneId;


@RequiredArgsConstructor
public class DocumentNumberGenerator {

    /**
     * The warehouse's time zone. The year in a document number follows German local time,
     * not the JVM zone (UTC in the Docker image), so documents created on New Year's Eve get the right year.
     */
    public static final ZoneId BUSINESS_ZONE = ZoneId.of("Europe/Berlin");

    public static String format(String prefix, int year, Long id) {
        return String.format("%s-%d-%04d", prefix, year, id);
    }
}
