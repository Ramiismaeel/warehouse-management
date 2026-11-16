package training.backend.exceptions;

/** 404: an entity with the given id does not exist. */
public class NotFoundException extends RuntimeException {

    /**
     * @param entityLabel German name shown to the user, e.g. "Artikel", "Kunde", "Wareneingang"
     */
    public NotFoundException(String entityLabel, Object id) {
        super("%s mit ID %s wurde nicht gefunden.".formatted(entityLabel, id));
    }
}