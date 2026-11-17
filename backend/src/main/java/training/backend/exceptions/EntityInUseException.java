package training.backend.exceptions;

/**
 * 409: an Artikel or Kunde cannot be deleted because documents use it (business rule 7).
 *
 * <pre>throw new EntityInUseException("Artikel", product.getName(), usages);</pre>
 * → "Artikel „Schraube M4“ wird in 3 Belegen verwendet."
 */
public class EntityInUseException extends RuntimeException {

    public EntityInUseException(String entityLabel, String name, long usageCount) {
        super("%s „%s“ wird in %d %s verwendet.".formatted(
                entityLabel, name, usageCount, usageCount == 1 ? "Beleg" : "Belegen"));
    }
}