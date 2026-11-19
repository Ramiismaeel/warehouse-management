package training.backend.document;

import lombok.RequiredArgsConstructor;


@RequiredArgsConstructor
public class DocumentNumberGenerator {

    public String format(String prefix, int year, Long id) {
        return String.format("%s-%d-%04d", prefix, year, id);
    }
}
