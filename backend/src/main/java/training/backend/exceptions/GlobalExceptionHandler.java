package training.backend.exceptions;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Turns every exception into an RFC 9457 ProblemDetail with a German, user-readable "detail".
 * Controllers never build error responses themselves (see CLAUDE.md → API conventions).
 * Extending ResponseEntityExceptionHandler also gives ProblemDetails for Spring's own errors
 * (unknown URL, wrong HTTP method, ...).
 */
@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // ---------- 400 ----------

    /** @Valid failed on a request body → 400 with "errors": { field: message }. */
    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex, HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        Map<String, String> errors = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(error -> errors.putIfAbsent(error.getField(), error.getDefaultMessage()));

        ProblemDetail problem = problem(HttpStatus.BAD_REQUEST, "Ungültige Eingabe",
                "Bitte prüfen Sie die markierten Felder.");
        problem.setProperty("errors", errors);
        return ResponseEntity.status(status).headers(headers).body(problem);
    }

    /** Malformed JSON or wrong types (e.g. text where a number is expected). */
    @Override
    protected ResponseEntity<Object> handleHttpMessageNotReadable(
            HttpMessageNotReadableException ex, HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        ProblemDetail problem = problem(HttpStatus.BAD_REQUEST, "Ungültige Eingabe",
                "Die Anfrage konnte nicht gelesen werden. Bitte prüfen Sie das Format der Daten.");
        return ResponseEntity.status(status).headers(headers).body(problem);
    }

    // ---------- 404 ----------

    @ExceptionHandler(NotFoundException.class)
    public ProblemDetail handleNotFound(NotFoundException ex) {
        return problem(HttpStatus.NOT_FOUND, "Nicht gefunden", ex.getMessage());
    }

    // ---------- 409 ----------

    /** Also returns "errors" so the frontend can show the message on the affected field. */
    @ExceptionHandler(DuplicateValueException.class)
    public ProblemDetail handleDuplicateValue(DuplicateValueException ex) {
        ProblemDetail problem = problem(HttpStatus.CONFLICT, "Wert bereits vergeben", ex.getMessage());
        problem.setProperty("errors", Map.of(ex.getField(), ex.getMessage()));
        return problem;
    }

    @ExceptionHandler({EntityInUseException.class, InvalidStatusTransitionException.class})
    public ProblemDetail handleConflict(RuntimeException ex) {
        return problem(HttpStatus.CONFLICT, "Aktion nicht möglich", ex.getMessage());
    }

    /** Returns "shortages": [{ productId, sku, name, requested, available }]. */
    @ExceptionHandler(InsufficientStockException.class)
    public ProblemDetail handleInsufficientStock(InsufficientStockException ex) {
        ProblemDetail problem = problem(HttpStatus.CONFLICT, "Nicht genügend Bestand", ex.getMessage());
        problem.setProperty("shortages", ex.getShortages());
        return problem;
    }

    /** Two requests changed the same Product at once (@Version, business rule 10). */
    @ExceptionHandler(OptimisticLockingFailureException.class)
    public ProblemDetail handleOptimisticLock(OptimisticLockingFailureException ex) {
        return problem(HttpStatus.CONFLICT, "Gleichzeitige Änderung",
                "Der Bestand wurde gleichzeitig geändert. Bitte erneut versuchen.");
    }

    /** Safety net: a DB constraint caught something the services missed (e.g. a foreign key). */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ProblemDetail handleDataIntegrity(DataIntegrityViolationException ex) {
        log.warn("Data integrity violation not caught by a service", ex);
        return problem(HttpStatus.CONFLICT, "Aktion nicht möglich",
                "Die Aktion verstößt gegen eine Datenregel, z. B. weil ein Datensatz noch verwendet wird.");
    }

    // ---------- 500 ----------

    /** Anything unexpected: log the details, never show them to the user. */
    @ExceptionHandler(Exception.class)
    public ProblemDetail handleUnexpected(Exception ex) {
        log.error("Unexpected error", ex);
        return problem(HttpStatus.INTERNAL_SERVER_ERROR, "Interner Fehler",
                "Ein unerwarteter Fehler ist aufgetreten. Bitte später erneut versuchen.");
    }

    private static ProblemDetail problem(HttpStatus status, String title, String detail) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(status, detail);
        problem.setTitle(title);
        return problem;
    }
}