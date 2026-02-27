package com.quickfood.deliveryservice.security;

/**
 * Holds the authenticated user's ID per request thread.
 */
public class UserContext {

    private static final ThreadLocal<Long> currentUserId = new ThreadLocal<>();

    public static void setUserId(Long userId) {
        currentUserId.set(userId);
    }

    public static Long getUserId() {
        return currentUserId.get();
    }

    public static void clear() {
        currentUserId.remove();
    }
}
