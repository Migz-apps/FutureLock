package com.futurelock.vault.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.bind.support.WebExchangeBindException;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log =
            LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(WebExchangeBindException.class)
    public Mono<ResponseEntity<Map<String, Object>>> handleValidationErrors(
            WebExchangeBindException ex) {

        Map<String, String> errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .collect(Collectors.toMap(
                        error -> error.getField(),
                        error -> error.getDefaultMessage() == null
                                ? "Invalid value"
                                : error.getDefaultMessage(),
                        (first, second) -> first,
                        LinkedHashMap::new));

        return Mono.just(ResponseEntity.badRequest()
                .body(Map.of(
                        "message", "Invalid request.",
                        "errors", errors)));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public Mono<ResponseEntity<Map<String, String>>> handleBadRequest(
            IllegalArgumentException ex) {

        return Mono.just(ResponseEntity.badRequest()
                .body(Map.of("message", safeMessage(ex))));
    }

    @ExceptionHandler(IllegalStateException.class)
    public Mono<ResponseEntity<Map<String, String>>> handleConflict(
            IllegalStateException ex) {

        HttpStatus status = safeMessage(ex).startsWith("Too many verification requests")
                ? HttpStatus.TOO_MANY_REQUESTS : HttpStatus.CONFLICT;
        return Mono.just(ResponseEntity.status(status)
                .body(Map.of("message", safeMessage(ex))));
    }

    @ExceptionHandler(ResponseStatusException.class)
    public Mono<ResponseEntity<Map<String, String>>> handleStatus(ResponseStatusException ex) {
        return Mono.just(ResponseEntity.status(ex.getStatusCode())
                .body(Map.of("message", ex.getReason() == null ? "Request failed." : ex.getReason())));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public Mono<ResponseEntity<Map<String, String>>> handleDataConflict(
            DataIntegrityViolationException ex) {

        return Mono.just(ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("message",
                        "An account with those details already exists.")));
    }

    @ExceptionHandler(Exception.class)
    public Mono<ResponseEntity<Map<String, String>>> handleGeneralError(
            Exception ex) {

        log.error("Unhandled backend error", ex);

        return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message",
                        "An unexpected server error occurred.")));
    }

    private String safeMessage(Exception ex) {
        return ex.getMessage() == null || ex.getMessage().isBlank()
                ? "Request failed."
                : ex.getMessage();
    }
}
