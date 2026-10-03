package com.artisanataschi.backend.dto;

public class UploadResponseDto {

    private String url;
    private String path;
    private String contentType;
    private Long size;

    public UploadResponseDto() {
    }

    public UploadResponseDto(String url, String path, String contentType, Long size) {
        this.url = url;
        this.path = path;
        this.contentType = contentType;
        this.size = size;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public Long getSize() {
        return size;
    }

    public void setSize(Long size) {
        this.size = size;
    }
}
