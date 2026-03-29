package com.futurelock.vault.repository;

import com.futurelock.vault.model.IntelMetadata;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

public interface IntelMetadataRepository extends ReactiveCrudRepository<IntelMetadata, UUID> {
    
    @Query("SELECT * FROM intel_metadata WHERE category = :category AND (title ILIKE '%' || :query || '%' OR description ILIKE '%' || :query || '%')")
    Flux<IntelMetadata> findByCategoryAndQuery(String category, String query);
    
    @Query("SELECT * FROM intel_metadata WHERE (title ILIKE '%' || :query || '%' OR description ILIKE '%' || :query || '%')")
    Flux<IntelMetadata> findByQuery(String query);

    Flux<IntelMetadata> findByCreator(String creator);
}
