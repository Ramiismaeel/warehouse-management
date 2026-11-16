package training.backend.exceptions;

import lombok.Getter;

/**
 * 409: a value that must be unique is already taken, e.g. a SKU.
 * The field name lets the frontend show the message directly on the form field.
 *
 * <pre>throw new DuplicateValueException("sku", "Die SKU „%s“ ist bereits vergeben.".formatted(sku));</pre>
 */
@Getter
public class DuplicateValueException extends RuntimeException {

    private final String field;

    public DuplicateValueException(String field, String message) {
        super(message);
        this.field = field;
    }

}