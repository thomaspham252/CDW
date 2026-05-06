package com.project.backend.service.auth;
import com.project.backend.config.JwtUtil;
import com.project.backend.dto.request.auth.GoogleLoginRequest;
import com.project.backend.dto.request.auth.LoginRequestDTO;
import com.project.backend.dto.request.auth.RegisterRequestDTO;
import com.project.backend.dto.response.auth.AuthResponseDTO;
import com.project.backend.dto.response.auth.GooglePayload;
import com.project.backend.entity.auth.User;
import com.project.backend.entity.auth.UserIdentity;
import com.project.backend.exception.AuthException;
import com.project.backend.exception.BadRequestException;
import com.project.backend.repository.auth.UserIdentityRepository;
import com.project.backend.repository.auth.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final UserIdentityRepository userIdentityRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final GoogleTokenVerifierService googleTokenVerifierService;

    public AuthResponseDTO register(RegisterRequestDTO req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new BadRequestException("Email này đã được sử dụng");
        }
        String encodedPassword = passwordEncoder.encode(req.getPassword());

        User newUser= User.builder()

                .email(req.getEmail())
                .passwordHash(encodedPassword)
                .fullname(req.getFullName())
                .build();

        User savedUser = userRepository.save(newUser);
        String jwtToken = jwtUtil.generateToken(savedUser);

        return AuthResponseDTO.builder()
                .token(jwtToken)
                .userId(savedUser.getId())
                .email(savedUser.getEmail())
                .fullName(savedUser.getFullname())
                .build();
    }

    public AuthResponseDTO login(LoginRequestDTO req) {

        // tìm user
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new AuthException("Email không tồn tại"));

        // check password
        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new AuthException("Sai mật khẩu");
        }

        // tạo token
        String token = jwtUtil.generateToken(user);

        // trả về
        return AuthResponseDTO.builder()
                .token(token)
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullname())
                .build();
    }

    public AuthResponseDTO loginWithGoogle(GoogleLoginRequest req){
        GooglePayload payload = googleTokenVerifierService.verify(req.getIdToken());

        String sub = payload.getSub();
        String email = payload.getEmail();
        String name = payload.getName();

        if (email == null || !Boolean.TRUE.equals(payload.getEmailVerified())) {
            throw new AuthException("Email chưa xác thực");
        }

        Optional<UserIdentity> identityOpt =
                userIdentityRepository.findByProviderAndProviderUserId("google", sub);

        User user = identityOpt
                .map(UserIdentity::getUser)
                .orElseGet(() -> {

                    User newUser = userRepository.findByEmail(email)
                            .orElseGet(() -> userRepository.save(
                                    User.builder()
                                            .email(email)
                                            .fullname(name)
                                            .build()
                            ));

                    UserIdentity identity = new UserIdentity();
                    identity.setProvider("google");
                    identity.setProviderUserId(sub);
                    identity.setEmail(email);
                    identity.setUser(newUser);

                    userIdentityRepository.save(identity);

                    return newUser;
                });

        String token = jwtUtil.generateToken(user);

        return AuthResponseDTO.builder()
                .token(token)
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullname())
                .build();
    }
}
