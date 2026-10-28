package com.klef.soa.docker.service;

import java.util.List;

import com.klef.soa.docker.entity.BusPass;

public interface BusPassService 
{
	BusPass addBusPass(BusPass b) ;
	List<BusPass> displayAllBusPass();
	BusPass displayById(Long id);
	BusPass updateBusPass(Long id, BusPass b);
	String deleteBusPassById(Long id);
	

}
