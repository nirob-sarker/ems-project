package com.sheharz.emsbackend.dto;

import com.sheharz.emsbackend.entity.LeaveStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateLeaveStatusRequest {

    @NotNull(message = "Status is required")
    private LeaveStatus status;
}