package com.project.backend.repository.voucher;

import com.project.backend.entity.voucher.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, Integer> {
    Optional<Voucher> findByCode(String code);
    List<Voucher> findAllByOrderByCreatedAtDesc();
    boolean existsByCode(String code);
}
