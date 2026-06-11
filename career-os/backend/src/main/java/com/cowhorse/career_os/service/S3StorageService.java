package com.cowhorse.career_os.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

import java.io.IOException;
import java.util.UUID;

@Service
public class S3StorageService {

    private final S3Client s3Client;
    
    @Value("${aws.s3.bucket.name:career-os-interview-bucket}")
    private String bucketName;

    public S3StorageService(
            @Value("${aws.access.key.id:YOUR_AWS_ACCESS_KEY}") String accessKey,
            @Value("${aws.secret.access.key:YOUR_AWS_SECRET_KEY}") String secretKey,
            @Value("${aws.region:us-east-1}") String region) {

        AwsBasicCredentials credentials = AwsBasicCredentials.create(accessKey, secretKey);
        this.s3Client = S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(credentials))
                .build();
    }

    public String uploadFile(MultipartFile file, UUID candidateId) throws IOException {
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : ".webm"; // default extension for media recorder
        String fileName = "interviews/" + candidateId.toString() + "/" + UUID.randomUUID() + extension;

        try {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileName)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            // Assuming public read is enabled or returning a standard URL format
            // If the bucket is private, presigned URLs should be generated later for playback.
            return "https://" + bucketName + ".s3.amazonaws.com/" + fileName;

        } catch (S3Exception e) {
            throw new IOException("Failed to upload file to S3: " + e.awsErrorDetails().errorMessage(), e);
        }
    }
}
