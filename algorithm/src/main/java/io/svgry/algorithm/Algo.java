package io.svgry.algorithm;

import java.awt.Color;
import java.awt.Graphics;
import java.awt.image.BufferedImage;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.ArrayList;
import java.util.List;

import javax.imageio.ImageIO;

import org.opencv.core.Core;
import org.opencv.core.Mat;
import org.opencv.core.MatOfPoint;
import org.opencv.core.MatOfPoint2f;
import org.opencv.core.Point;
import org.opencv.imgcodecs.Imgcodecs;
import org.opencv.imgproc.Imgproc;

public class Algo {

	private static final Color COLORS[] = new Color[] { Color.BLUE, Color.CYAN, Color.GREEN, Color.MAGENTA,
			Color.ORANGE, Color.PINK, Color.RED, Color.YELLOW };

	public static void main(String... args) throws Exception {
		System.loadLibrary(Core.NATIVE_LIBRARY_NAME);

		StringBuilder sb=new StringBuilder("[");
		for (int k = 1; k <= 7; k++) {
			BufferedImage bi = ImageIO.read(new File("./sclr/" + k + ".jpg"));
			Mat img = Imgcodecs.imread("./sclr/" + k + ".jpg", Imgcodecs.IMREAD_GRAYSCALE);

			Mat threshold = new Mat(img.height(), img.width(), img.type());
			Imgproc.threshold(img, threshold, 110, 255, Imgproc.THRESH_BINARY);
			List<MatOfPoint> contours = new ArrayList<>();
			Mat hierarchy = new Mat();
			Imgproc.findContours(threshold, contours, hierarchy, Imgproc.RETR_CCOMP, Imgproc.CHAIN_APPROX_SIMPLE);

			int i = 1;
			Graphics g = bi.getGraphics();
			double areaMinThresh = bi.getWidth() * bi.getHeight() * 0.2 / 100;
			double areaMaxThresh = bi.getWidth() * bi.getHeight() * 98 / 100;
			double area;			
			sb.append("[");
			for (MatOfPoint cnt : contours) {

				area = Imgproc.contourArea(cnt);				
				if (area < areaMinThresh || area > areaMaxThresh )
					continue;
				
				MatOfPoint2f cnt2f = new MatOfPoint2f(cnt.toArray());
				g.setColor(COLORS[i % COLORS.length]);				
				Point[] pts = cnt2f.toArray();
				i++;
				sb.append("[["+pts[0].x+", "+pts[0].y+"]");
				for (int j = 0; j < pts.length - 1; j++) {
					sb.append(", ["+pts[j+1].x+", "+pts[j+1].y+"]");
					g.drawLine((int) Math.round(pts[j].x - 1), (int) Math.round(pts[j].y - 1),
							(int) Math.round(pts[j + 1].x - 1), (int) Math.round(pts[j + 1].y - 1));
					g.drawLine((int) Math.round(pts[j].x), (int) Math.round(pts[j].y), (int) Math.round(pts[j + 1].x),
							(int) Math.round(pts[j + 1].y));
					g.drawLine((int) Math.round(pts[j].x + 1), (int) Math.round(pts[j].y + 1),
							(int) Math.round(pts[j + 1].x + 1), (int) Math.round(pts[j + 1].y + 1));
				}
				sb.append("],");
			}
			sb.deleteCharAt(sb.length()-1);
			sb.append("]"+(k == 7 ? "" : ",")+"\n");
			g.dispose();
			ImageIO.write(bi, "jpg", new File("./sclr/" + k + "out.jpg"));
		}
		sb.append("]");
		Files.write(Paths.get(".", "/sclr/output.json"), sb.toString().getBytes(), StandardOpenOption.CREATE);
	}
}
