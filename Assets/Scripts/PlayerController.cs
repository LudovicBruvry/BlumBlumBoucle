using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class PlayerController : MonoBehaviour
{

    public GameObject playerShip;

    // Start is called before the first frame update
    void Start()
    {
        Debug.Log("Here We Goo !");
    }

    // Update is called once per frame
    void Update()
    {
        playerShip.transform.Translate(Vector2.up * Time.deltaTime * 2.0f);
    }
}
