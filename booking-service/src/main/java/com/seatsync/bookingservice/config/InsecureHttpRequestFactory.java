package com.seatsync.bookingservice.config;

import org.springframework.http.client.SimpleClientHttpRequestFactory;
import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.security.cert.X509Certificate;

public class InsecureHttpRequestFactory extends SimpleClientHttpRequestFactory {
    @Override
    protected void prepareConnection(HttpURLConnection connection, String httpMethod) throws IOException {
        if (connection instanceof HttpsURLConnection) {
            HttpsURLConnection httpsConnection = (HttpsURLConnection) connection;
            httpsConnection.setHostnameVerifier((hostname, session) -> true);
            try {
                SSLContext sslContext = SSLContext.getInstance("TLS");
                sslContext.init(null, new TrustManager[]{new X509TrustManager() {
                    public X509Certificate[] getAcceptedIssuers() { return null; }
                    public void checkClientTrusted(X509Certificate[] certs, String authType) {}
                    public void checkServerTrusted(X509Certificate[] certs, String authType) {}
                }}, new java.security.SecureRandom());
                httpsConnection.setSSLSocketFactory(sslContext.getSocketFactory());
            } catch (Exception e) {
                // Ignore
            }
        }
        super.prepareConnection(connection, httpMethod);
    }
}
