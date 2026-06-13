package com.cowhorse.career_os.exception;

public class DuplicateOrganisationNameException extends RuntimeException {
    public DuplicateOrganisationNameException(String name) {
        super("An organisation named \"" + name + "\" already exists.");
    }
}
