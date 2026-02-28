package com.quickfood.coreservice.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // ── Path 1: request came through the API Gateway ──────────────────────
        // The gateway validates the JWT and forwards X-User-Id + Authorization header.
        // We read from the Authorization header (gateway re-forwards it), OR fall back
        // to just the X-User-Id header for internal service-to-service calls.
        String xUserId = request.getHeader("X-User-Id");
        String token   = extractToken(request);

        if (StringUtils.hasText(token)) {
            // ── Path 1a: Bearer JWT present — validate it directly ─────────────
            try {
                Claims claims = jwtUtil.validateToken(token);
                Long userId = claims.get("id", Long.class);
                String role = claims.get("role", String.class);

                setAuthentication(userId, role);
                log.debug("JWT auth: userId={}, role={}", userId, role);
            } catch (JwtException | IllegalArgumentException e) {
                log.warn("Invalid JWT token: {}", e.getMessage());
            }
        } else if (StringUtils.hasText(xUserId)) {
            // ── Path 1b: No Bearer token, but X-User-Id present ───────────────
            // This is an internal call (e.g., delivery-service calling /delivered).
            // We authenticate as a system principal with no role restrictions.
            try {
                Long userId = Long.parseLong(xUserId);
                setAuthentication(userId, "SYSTEM");
                log.debug("X-User-Id auth: userId={}", userId);
            } catch (NumberFormatException e) {
                log.warn("Invalid X-User-Id header: {}", xUserId);
            }
        }

        filterChain.doFilter(request, response);
    }

    private void setAuthentication(Long userId, String role) {
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        userId,
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_" + role))
                );
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    private String extractToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
