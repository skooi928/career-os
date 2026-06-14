// package com.cowhorse.career_os.repository;
// import com.cowhorse.career_os.entity.Network;
// import org.springframework.data.jpa.repository.JpaRepository;
// import org.springframework.data.jpa.repository.Query;
// import org.springframework.stereotype.Repository;
// import java.util.List;
// import java.util.Optional;
// import java.util.UUID;
 
// @Repository
// public interface NetworkRepository extends JpaRepository<Network, Long> {
//     Optional<Network> findByRequesterIdAndAddresseeId(UUID requesterId, UUID addresseeId);
 
//     @Query("SELECT n FROM Network n WHERE (n.requesterId = :userId OR n.addresseeId = :userId) AND n.status = 'accepted'")
//     List<Network> findAcceptedConnectionsByUserId(UUID userId);
 
//     @Query("SELECT n FROM Network n WHERE n.addresseeId = :userId AND n.status = 'pending'")
//     List<Network> findPendingRequestsForUser(UUID userId);
 
//     @Query("SELECT CASE WHEN COUNT(n) > 0 THEN true ELSE false END FROM Network n " +
//            "WHERE ((n.requesterId = :user1 AND n.addresseeId = :user2) OR " +
//            "(n.requesterId = :user2 AND n.addresseeId = :user1)) AND n.status = 'accepted'")
//     boolean areConnected(UUID user1, UUID user2);
 
//     @Query("SELECT CASE WHEN COUNT(n) > 0 THEN true ELSE false END FROM Network n " +
//            "WHERE n.requesterId = :requesterId AND n.addresseeId = :addresseeId")
//     boolean requestExists(UUID requesterId, UUID addresseeId);
// }
package com.cowhorse.career_os.repository;

import com.cowhorse.career_os.entity.Network;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NetworkRepository extends JpaRepository<Network, Long> {
    
    Optional<Network> findByRequesterIdAndAddresseeId(UUID requesterId, UUID addresseeId);

    @Query("SELECT n FROM Network n WHERE (n.requesterId = :userId OR n.addresseeId = :userId) AND n.status = 'accepted'")
    List<Network> findAcceptedConnectionsByUserId(@Param("userId") UUID userId);

    @Query("SELECT n FROM Network n WHERE n.addresseeId = :userId AND n.status = 'pending'")
    List<Network> findPendingRequestsForUser(@Param("userId") UUID userId);

    @Query("SELECT CASE WHEN COUNT(n) > 0 THEN true ELSE false END FROM Network n " +
           "WHERE ((n.requesterId = :user1 AND n.addresseeId = :user2) OR " +
           "(n.requesterId = :user2 AND n.addresseeId = :user1)) AND n.status = 'accepted'")
    boolean areConnected(@Param("user1") UUID user1, @Param("user2") UUID user2);

    /* FIX: Now checks both directions to prevent User A and User B from sending pending requests to each other simultaneously */
    @Query("SELECT CASE WHEN COUNT(n) > 0 THEN true ELSE false END FROM Network n " +
           "WHERE (n.requesterId = :requesterId AND n.addresseeId = :addresseeId) OR " +
           "(n.requesterId = :addresseeId AND n.addresseeId = :requesterId)")
    boolean requestExists(@Param("requesterId") UUID requesterId, @Param("addresseeId") UUID addresseeId);
}
