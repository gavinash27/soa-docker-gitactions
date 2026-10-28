package com.klef.soa.docker.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.klef.soa.docker.entity.BusPass;
import com.klef.soa.docker.repository.BusPassRepository;

@Service
public class BusPassServiceImpl implements BusPassService{
	@Autowired
	private BusPassRepository busrepo;

	@Override
	public BusPass addBusPass(BusPass b) {
	
		return busrepo.save(b);
	}

	@Override
	public List<BusPass> displayAllBusPass() {
		return busrepo.findAll();
	}

	@Override
	public String deleteBusPassById(Long id) {
		boolean flag = busrepo.existsById(id);
		if(flag)
		{
			busrepo.deleteById(id);
			return "BusPass Deleted Successfully";
		}
		else
		{
			return "BusPass ID Not Found";
		}
	}

	@Override
	public BusPass displayById(Long id) {
	    return busrepo.findById(id).orElse(null);
	}

	@Override
	public BusPass updateBusPass(Long id, BusPass b) {
	    BusPass buspass = busrepo.findById(id).orElse(null);

	    if (buspass != null) {
	        buspass.setPassNumber(b.getPassNumber());
	        buspass.setHolderName(b.getHolderName());
	        buspass.setValidUntil(b.getValidUntil());
	        buspass.setFee(b.getFee());

	        return busrepo.save(buspass);
	    }

	    return null;
	}

}
