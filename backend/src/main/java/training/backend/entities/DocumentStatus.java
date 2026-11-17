package training.backend.entities;

public enum DocumentStatus {
    DRAFT,
    CONFIRMED,
    CANCELLED;

    /** Only drafts can be edited or deleted. */
    public boolean canEdit() {
        return this == DRAFT;
    }

    public boolean canConfirm() {
        return this == DRAFT;
    }

    public boolean canCancel() {
        return this == CONFIRMED;
    }
}
