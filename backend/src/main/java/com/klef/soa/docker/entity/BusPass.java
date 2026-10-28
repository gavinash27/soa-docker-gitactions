package com.klef.soa.docker.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "BusPass_table")
public class BusPass
{
	@Id 
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "bid")
	private Long id;
	@Column( length = 100, nullable = false)
	private String passNumber;
	@Column(name = "holdername", length = 100, nullable = false)
	private String holderName;
	@Column(length = 100, nullable = false)
	private String validUntil;
	@Column(name = "fee", length = 100, nullable = false)
	private double fee;
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public String getPassNumber() {
		return passNumber;
	}
	public void setPassNumber(String passNumber) {
		this.passNumber = passNumber;
	}
	public String getHolderName() {
		return holderName;
	}
	public void setHolderName(String holderName) {
		this.holderName = holderName;
	}
	public String getValidUntil() {
		return validUntil;
	}
	public void setValidUntil(String validUntil) {
		this.validUntil = validUntil;
	}
	public double getFee() {
		return fee;
	}
	public void setFee(double fee) {
		this.fee = fee;
	}
	@Override
	public String toString() {
		return "BusPass [id=" + id + ", passNumber=" + passNumber + ", holderName=" + holderName + ", validUntil="
				+ validUntil + ", fee=" + fee + "]";
	}
	

}